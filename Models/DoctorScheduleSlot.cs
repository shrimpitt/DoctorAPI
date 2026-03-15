using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("doctor_schedule_slots")]
    public class DoctorScheduleSlot
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("consultation_type_id")]
        public long? ConsultationTypeId { get; set; }

        [Column("slot_date")]
        public DateTime SlotDate { get; set; }

        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Column("end_time")]
        public TimeSpan EndTime { get; set; }

        [Column("is_available")]
        public bool IsAvailable { get; set; }

        [Column("reserved_by_appointment_id")]
        public long? ReservedByAppointmentId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}