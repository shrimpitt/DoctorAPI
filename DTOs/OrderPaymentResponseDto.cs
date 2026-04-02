namespace DoctorAPI.DTOs
{
    public class OrderPaymentResponseDto
    {
        public long OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string? PaymentMethod { get; set; }
        public string? PaymentProvider { get; set; }
        public string? PaymentSessionId { get; set; }
        public string? ExternalPaymentId { get; set; }
        public string? PaymentUrl { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
