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

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}