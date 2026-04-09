namespace DoctorAPI.Options
{
    public class PayPalOptions
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api-m.sandbox.paypal.com";
        public bool UseFixedDemoAmount { get; set; } = true;
        public decimal FixedDemoAmountUsd { get; set; } = 10.00m;
    }
}
