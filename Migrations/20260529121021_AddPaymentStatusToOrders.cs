using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoctorAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentStatusToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE public.orders
                ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment';
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE public.orders
                DROP COLUMN IF EXISTS payment_status;
            """);
        }
    }
}
