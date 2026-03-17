namespace DoctorAPI.DTOs
{
    public class AvailableSlotItemDto
    {
        public long SlotId { get; set; }
        public long ConsultationTypeId { get; set; }
        public string ConsultationTypeName { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
    }
}