using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("doctor_education")]
    public class DoctorEducation
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("doctor_profile_id")]
        public long DoctorProfileId { get; set; }

        [Column("institution_name")]
        public string InstitutionName { get; set; }

        [Column("faculty")]
        public string? Faculty { get; set; }

        [Column("specialization")]
        public string? Specialization { get; set; }

        [Column("start_year")]
        public int? StartYear { get; set; }

        [Column("end_year")]
        public int? EndYear { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("sort_order")]
        public int SortOrder { get; set; }
    }
}