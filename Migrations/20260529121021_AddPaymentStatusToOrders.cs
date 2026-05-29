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
            migrationBuilder.AddColumn<string>(
                name: "payment_status",
                schema: "public",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "awaiting_payment");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "payment_status",
                schema: "public",
                table: "orders");
        }
    }
}
