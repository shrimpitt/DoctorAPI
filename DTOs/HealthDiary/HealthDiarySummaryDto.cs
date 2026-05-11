namespace DoctorAPI.DTOs.HealthDiary
{
    public class HealthDiarySummaryDto
    {
        public long UserId { get; set; }

        public DateTime? PeriodStart { get; set; }

        public DateTime? PeriodEnd { get; set; }

        public int TotalEntries { get; set; }

        public decimal? AverageWeightKg { get; set; }

        public decimal? AverageBloodSugar { get; set; }

        public decimal? AverageSleepHours { get; set; }

        public int MedicationTakenCount { get; set; }

        public int MedicationMissedCount { get; set; }

        public List<string> CommonSymptoms { get; set; } = new();

        public string Disclaimer { get; set; } =
            "This summary is based on patient-entered data and is not a medical diagnosis.";
    }
}