using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("appointments")]
    public class Appointment
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("consultation_type_id")]
        public long? ConsultationTypeId { get; set; }

        [Column("schedule_slot_id")]
        public long? ScheduleSlotId { get; set; }

        [Column("user_id")]
        public long? UserId { get; set; }

        public User? User { get; set; }

        [Column("full_name")]
        public string FullName { get; set; }

        [Column("phone")]
        public string Phone { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}