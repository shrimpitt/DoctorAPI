using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("health_diary_ai_summaries")]
    public class HealthDiaryAiSummary
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("user_id")]
        public long UserId { get; set; }

        public User? User { get; set; }

        [Column("period_start")]
        public DateTime PeriodStart { get; set; }

        [Column("period_end")]
        public DateTime PeriodEnd { get; set; }

        [Column("summary_text")]
        public string SummaryText { get; set; } = string.Empty;

        [Column("observations")]
        public string? Observations { get; set; }

        [Column("doctor_attention_points")]
        public string? DoctorAttentionPoints { get; set; }

        [Column("disclaimer")]
        public string Disclaimer { get; set; } =
            "This AI-generated summary is not a diagnosis and must be reviewed by a doctor.";

        [Column("ai_provider")]
        public string? AiProvider { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}