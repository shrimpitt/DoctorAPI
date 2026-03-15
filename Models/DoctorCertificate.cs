using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("doctor_certificates")]
    public class DoctorCertificate
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("doctor_profile_id")]
        public long DoctorProfileId { get; set; }

        [Column("title")]
        public string Title { get; set; }

        [Column("issuer")]
        public string? Issuer { get; set; }

        [Column("issue_year")]
        public int? IssueYear { get; set; }

        [Column("file_url")]
        public string? FileUrl { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("sort_order")]
        public int SortOrder { get; set; }
    }
}