using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;
using DoctorAPI.DTOs;
using DoctorAPI.Models;

namespace DoctorAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _context.Orders
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id}")]
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
        public async Task<ActionResult> CreateOrder(CreateOrderDto dto)
        {
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
                PaymentStatus = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
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

        [HttpPatch("{id}/status")]
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
    }
}