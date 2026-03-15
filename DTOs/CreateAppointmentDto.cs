namespace DoctorAPI.DTOs
{
    public class CreateAppointmentDto
    {
        public long ConsultationTypeId { get; set; }
        public long ScheduleSlotId { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string? Email { get; set; }
        public string? Comment { get; set; }
    }
}