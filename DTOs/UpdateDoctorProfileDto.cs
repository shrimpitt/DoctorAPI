using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class UpdateDoctorProfileDto
    {
        [Required]
        public string FullName { get; set; }

        public string? Title { get; set; }
        public string? ShortBio { get; set; }
        public string? FullBio { get; set; }
        public int? ExperienceYears { get; set; }
        public string? MainPhotoUrl { get; set; }
        public string? WhatsappPhone { get; set; }
        public string? Email { get; set; }
        public string? InstagramUrl { get; set; }
    }
}