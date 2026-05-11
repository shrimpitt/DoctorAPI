namespace DoctorAPI.DTOs.HealthDiary
{
    public class HealthDiaryEntryResponseDto
    {
        public long Id { get; set; }

        public long UserId { get; set; }

        public DateTime EntryDate { get; set; }

        public decimal? WeightKg { get; set; }

        public int? SystolicPressure { get; set; }

        public int? DiastolicPressure { get; set; }

        public decimal? BloodSugar { get; set; }

        public int? SleepHours { get; set; }

        public string? Symptoms { get; set; }

        public string? Mood { get; set; }

        public bool? TookMedication { get; set; }

        public string? MedicationNotes { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}