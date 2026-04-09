using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DoctorAPI.Data;
using DoctorAPI.DTOs;
using DoctorAPI.Models;
using DoctorAPI.Options;
using DoctorAPI.Services;
using Microsoft.Extensions.Options;

namespace DoctorAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPayPalService _payPalService;
        private readonly PayPalOptions _payPalOptions;

        public OrdersController(AppDbContext context, IPayPalService payPalService, IOptions<PayPalOptions> payPalOptions)
        {
            _context = context;
            _payPalService = payPalService;
            _payPalOptions = payPalOptions.Value;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,admin")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _context.Orders
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:long}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<ActionResult> GetOrderById(long id)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            var items = await _context.OrderItems
                .Where(i => i.OrderId == id)
                .ToListAsync();

            return Ok(new
            {
                order,
                items
            });
        }

        [HttpPost]
        [Authorize(Roles = "User,user")]
        public async Task<ActionResult> CreateOrder(CreateOrderDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "User is not authenticated" });

            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest(new { message = "Заказ должен содержать хотя бы один товар" });

            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                var product = await _context.Products.FirstOrDefaultAsync(p => p.id == item.ProductId);

                if (product == null)
                    return NotFound(new { message = $"Товар с id={item.ProductId} не найден" });

                if (item.Quantity <= 0)
                    return BadRequest(new { message = "Количество товара должно быть больше 0" });

                var itemTotal = product.price * item.Quantity;
                totalAmount += itemTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.id,
                    ProductName = product.name,
                    UnitPrice = product.price,
                    Quantity = item.Quantity,
                    TotalPrice = itemTotal
                });
            }

            var order = new Order
            {
                OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}",
                FullName = dto.FullName,
                Phone = dto.Phone,
                Email = dto.Email,
                City = dto.City,
                AddressLine = dto.AddressLine,
                Comment = dto.Comment,
                TotalAmount = totalAmount,
                Status = "pending",
                PaymentStatus = "unpaid",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var item in orderItems)
            {
                item.OrderId = order.Id;
            }

            _context.OrderItems.AddRange(orderItems);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Заказ успешно создан",
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                totalAmount = order.TotalAmount
            });
        }

        [HttpGet("my")]
        [Authorize(Roles = "User,user")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var orders = await _context.Orders
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("my/{id:long}")]
        [Authorize(Roles = "User,user")]
        public async Task<IActionResult> GetMyOrderById(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var order = await _context.Orders
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            var items = await _context.OrderItems
                .Where(x => x.OrderId == id)
                .ToListAsync();

            return Ok(new
            {
                order,
                items
            });
        }

        [HttpPost("{id:long}/payment/init")]
        [Authorize(Roles = "User,user")]
        public async Task<ActionResult<OrderPaymentResponseDto>> InitPayment(long id, [FromBody] InitOrderPaymentDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "User is not authenticated" });

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            if (order.Status == "cancelled")
                return BadRequest(new { message = "Отмененный заказ нельзя оплатить" });

            if (order.PaymentStatus == "paid")
                return BadRequest(new { message = "Заказ уже оплачен" });

            order.Status = "awaiting_payment";
            order.PaymentStatus = "pending";
            order.PaymentMethod = dto.PaymentMethod;
            order.PaymentProvider = "cloudpayments";
            order.PaymentSessionId = Guid.NewGuid().ToString("N");
            order.ExternalPaymentId = null;
            order.PaymentUrl = null;
            order.PaidAt = null;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapPaymentResponse(order));
        }

        [HttpPost("{id:long}/payment/mock-success")]
        [Authorize(Roles = "User,user")]
        public async Task<ActionResult<OrderPaymentResponseDto>> MockPaymentSuccess(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "User is not authenticated" });

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            if (order.Status == "cancelled")
                return BadRequest(new { message = "Отмененный заказ нельзя оплатить" });

            if (order.PaymentStatus == "paid")
                return BadRequest(new { message = "Заказ уже оплачен" });

            if (order.PaymentStatus != "pending")
                return BadRequest(new { message = "Оплата не инициализирована" });

            order.Status = "paid";
            order.PaymentStatus = "paid";
            order.ExternalPaymentId = $"mock_{Guid.NewGuid():N}";
            order.PaidAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapPaymentResponse(order));
        }

        [HttpPost("{id:long}/payment/mock-fail")]
        [Authorize(Roles = "User,user")]
        public async Task<ActionResult<OrderPaymentResponseDto>> MockPaymentFail(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "User is not authenticated" });

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            if (order.Status == "cancelled")
                return BadRequest(new { message = "Отмененный заказ нельзя оплатить" });

            if (order.PaymentStatus == "paid")
                return BadRequest(new { message = "Заказ уже оплачен" });

            if (order.PaymentStatus != "pending")
                return BadRequest(new { message = "Оплата не инициализирована" });

            order.Status = "pending";
            order.PaymentStatus = "failed";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapPaymentResponse(order));
        }

        [HttpPost("{id:long}/payment/paypal/create-order")]
        [Authorize(Roles = "User,user")]
        public async Task<ActionResult<CreatePayPalOrderResponseDto>> CreatePayPalOrder(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "User is not authenticated" });

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            if (order.Status == "cancelled")
                return BadRequest(new { message = "Отмененный заказ нельзя оплатить" });

            if (order.PaymentStatus == "paid")
                return BadRequest(new { message = "Заказ уже оплачен" });

            var amountForPayPal = _payPalOptions.UseFixedDemoAmount
                ? _payPalOptions.FixedDemoAmountUsd
                : order.TotalAmount;

            try
            {
                var (payPalOrderId, payPalStatus) = await _payPalService.CreateOrderAsync(amountForPayPal, "USD");

                order.Status = "awaiting_payment";
                order.PaymentStatus = "pending";
                order.PaymentProvider = "paypal";
                order.PaymentMethod = "paypal";
                order.PaymentSessionId = payPalOrderId;
                order.ExternalPaymentId = null;
                order.PaidAt = null;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new CreatePayPalOrderResponseDto
                {
                    PayPalOrderId = payPalOrderId,
                    Status = payPalStatus
                });
            }
            catch (Exception ex)
            {
                return StatusCode(502, new { message = "PayPal create order failed", details = ex.Message });
            }
        }

        [HttpPost("{id:long}/payment/paypal/capture")]
        [Authorize(Roles = "User,user")]
        public async Task<ActionResult<CapturePayPalOrderResponseDto>> CapturePayPalOrder(long id, [FromBody] CapturePayPalOrderRequestDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "User is not authenticated" });

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            if (order.Status == "cancelled")
                return BadRequest(new { message = "Отмененный заказ нельзя оплатить" });

            if (order.PaymentStatus == "paid")
                return BadRequest(new { message = "Заказ уже оплачен" });

            if (string.IsNullOrWhiteSpace(order.PaymentSessionId) || order.PaymentSessionId != dto.PayPalOrderId)
                return BadRequest(new { message = "Неверный PayPal order id" });

            var result = await _payPalService.CaptureOrderAsync(dto.PayPalOrderId);

            if (!result.Success)
            {
                order.Status = "pending";
                order.PaymentStatus = "failed";
                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return BadRequest(new { message = "PayPal capture failed", paypalStatus = result.Status });
            }

            order.Status = "paid";
            order.PaymentStatus = "paid";
            order.PaymentProvider = "paypal";
            order.PaymentMethod = "paypal";
            order.ExternalPaymentId = result.CaptureId ?? dto.PayPalOrderId;
            order.PaidAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new CapturePayPalOrderResponseDto
            {
                OrderId = order.Id,
                Status = order.Status,
                PaymentStatus = order.PaymentStatus,
                PaymentProvider = order.PaymentProvider,
                PaymentMethod = order.PaymentMethod,
                ExternalPaymentId = order.ExternalPaymentId,
                PaidAt = order.PaidAt
            });
        }

        [HttpPatch("{id:long}/status")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<ActionResult> UpdateOrderStatus(long id, UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Статус заказа обновлен" });
        }

        private static OrderPaymentResponseDto MapPaymentResponse(Order order)
        {
            return new OrderPaymentResponseDto
            {
                OrderId = order.Id,
                Status = order.Status,
                PaymentStatus = order.PaymentStatus,
                PaymentMethod = order.PaymentMethod,
                PaymentProvider = order.PaymentProvider,
                PaymentSessionId = order.PaymentSessionId,
                ExternalPaymentId = order.ExternalPaymentId,
                PaymentUrl = order.PaymentUrl,
                PaidAt = order.PaidAt
            };
        }
    }
}