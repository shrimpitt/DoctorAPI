namespace DoctorAPI.DTOs.HealthDiary
{
    public class HealthDiaryAiSummaryResponseDto
    {
        public long Id { get; set; }

        public long UserId { get; set; }

        public DateTime PeriodStart { get; set; }

        public DateTime PeriodEnd { get; set; }

        public string SummaryText { get; set; } = string.Empty;

        public string? Observations { get; set; }

        public string? DoctorAttentionPoints { get; set; }

        public string Disclaimer { get; set; } = string.Empty;

        public string? AiProvider { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}