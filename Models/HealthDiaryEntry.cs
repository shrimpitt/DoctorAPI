using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("health_diary_entries")]
    public class HealthDiaryEntry
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("user_id")]
        public long UserId { get; set; }

        public User? User { get; set; }

        [Required]
        [Column("entry_date")]
        public DateTime EntryDate { get; set; }

        [Column("weight_kg")]
        public decimal? WeightKg { get; set; }

        [Column("systolic_pressure")]
        public int? SystolicPressure { get; set; }

        [Column("diastolic_pressure")]
        public int? DiastolicPressure { get; set; }

        [Column("blood_sugar")]
        public decimal? BloodSugar { get; set; }

        [Column("sleep_hours")]
        public int? SleepHours { get; set; }

        [Column("symptoms")]
        public string? Symptoms { get; set; }

        [Column("mood")]
        public string? Mood { get; set; }

        [Column("took_medication")]
        public bool? TookMedication { get; set; }

        [Column("medication_notes")]
        public string? MedicationNotes { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}