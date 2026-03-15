using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("products")]
    public class Product
    {
        public long id { get; set; }

        public long? category_id { get; set; }

        public string name { get; set; }

        public string slug { get; set; }

        public string? sku { get; set; }

        public string? short_description { get; set; }

        public string? full_description { get; set; }

        public decimal price { get; set; }

        public int stock_qty { get; set; }

        public bool is_active { get; set; }

        public string? main_image_url { get; set; }

        public DateTime created_at { get; set; }

        public DateTime updated_at { get; set; }
    }
}