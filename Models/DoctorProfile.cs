using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("doctor_profile")]
    public class DoctorProfile
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("full_name")]
        public string FullName { get; set; }

        [Column("title")]
        public string? Title { get; set; }

        [Column("short_bio")]
        public string? ShortBio { get; set; }

        [Column("full_bio")]
        public string? FullBio { get; set; }

        [Column("experience_years")]
        public int? ExperienceYears { get; set; }

        [Column("main_photo_url")]
        public string? MainPhotoUrl { get; set; }

        [Column("whatsapp_phone")]
        public string? WhatsappPhone { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("instagram_url")]
        public string? InstagramUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}