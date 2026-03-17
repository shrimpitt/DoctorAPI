using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class UpdateDoctorCertificateDto
    {
        [Required]
        public long DoctorProfileId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Issuer { get; set; }
        public int? IssueYear { get; set; }
        public string? FileUrl { get; set; }
        public string? Description { get; set; }
        public int SortOrder { get; set; }
    }
}