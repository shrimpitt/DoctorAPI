using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoctorAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentFieldsToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "external_payment_id",
                schema: "public",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "paid_at",
                schema: "public",
                table: "orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payment_method",
                schema: "public",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payment_provider",
                schema: "public",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payment_session_id",
                schema: "public",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payment_url",
                schema: "public",
                table: "orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "external_payment_id",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "paid_at",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "payment_method",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "payment_provider",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "payment_session_id",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "payment_url",
                schema: "public",
                table: "orders");
        }
    }
}
