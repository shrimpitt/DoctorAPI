using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("order_items")]
    public class OrderItem
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("order_id")]
        public long OrderId { get; set; }

        [Column("product_id")]
        public long? ProductId { get; set; }

        [Column("product_name")]
        public string ProductName { get; set; }

        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("total_price")]
        public decimal TotalPrice { get; set; }
    }
}