using Microsoft.AspNetCore.Mvc;

namespace DoctorAPI.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        [HttpPost("cloudpayments/webhook")]
        public IActionResult CloudPaymentsWebhook()
        {
            return Ok(new { message = "Webhook endpoint is ready." });
        }
    }
}
