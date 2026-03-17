using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class UpdateDoctorEducationDto
    {
        [Required]
        public long DoctorProfileId { get; set; }

        [Required]
        public string InstitutionName { get; set; } = string.Empty;

        public string? Faculty { get; set; }
        public string? Specialization { get; set; }
        public int? StartYear { get; set; }
        public int? EndYear { get; set; }
        public string? Description { get; set; }
        public int SortOrder { get; set; }
    }
}