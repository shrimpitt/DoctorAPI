namespace DoctorAPI.DTOs
{
    public class CreatePayPalOrderResponseDto
    {
        public string PayPalOrderId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
