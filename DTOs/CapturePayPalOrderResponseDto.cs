namespace DoctorAPI.DTOs
{
    public class CapturePayPalOrderResponseDto
    {
        public long OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string? PaymentProvider { get; set; }
        public string? PaymentMethod { get; set; }
        public string? ExternalPaymentId { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
