using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("peptide_recommendations", Schema = "public")]
    public class PeptideRecommendation
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("product_id")]
        public long ProductId { get; set; }

        [Column("reasoning")]
        public string Reasoning { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        public User? User { get; set; }
        public Product? Product { get; set; }
    }
}
