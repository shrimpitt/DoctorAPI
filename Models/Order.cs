using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("orders", Schema = "public")]
    public class Order
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("order_number")]
        public string OrderNumber { get; set; }

        [Column("full_name")]
        public string FullName { get; set; }

        [Column("phone")]
        public string Phone { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("city")]
        public string? City { get; set; }

        [Column("address_line")]
        public string? AddressLine { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("total_amount")]
        public decimal TotalAmount { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("payment_status")]
        public string PaymentStatus { get; set; }

        [Column("payment_method")]
        public string? PaymentMethod { get; set; }

        [Column("payment_provider")]
        public string? PaymentProvider { get; set; }

        [Column("external_payment_id")]
        public string? ExternalPaymentId { get; set; }

        [Column("payment_url")]
        public string? PaymentUrl { get; set; }

        [Column("payment_session_id")]
        public string? PaymentSessionId { get; set; }

        [Column("paid_at")]
        public DateTime? PaidAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("user_id")]
        public long? UserId { get; set; }

        public User? User { get; set; }
    }
}