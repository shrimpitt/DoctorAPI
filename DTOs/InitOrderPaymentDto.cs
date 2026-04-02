using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class InitOrderPaymentDto
    {
        [Required]
        [RegularExpression("card|apple_pay|google_pay", ErrorMessage = "PaymentMethod must be: card, apple_pay, or google_pay.")]
        public string PaymentMethod { get; set; } = "card";
    }
}
