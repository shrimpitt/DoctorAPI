import { useState, useEffect } from "react";
import {
  detectCardNetwork,
  formatCardNumber,
  formatExpiry,
  validateCard,
  shouldDecline,
} from "../../services/paymentService";
import { initOrderPayment, mockPaymentSuccess, mockPaymentFail } from "../../api";
import "./PaymentModal.css";

// ── SVG assets ───────────────────────────────────────────────────────────────

function VisaLogo({ className = "" }) {
  return (
    <svg className={`net-logo ${className}`} viewBox="0 0 60 20" fill="none">
      <text x="0" y="17" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="20" fill="white" letterSpacing="-1">
        VISA
      </text>
    </svg>
  );
}

function MasterCardLogo({ className = "" }) {
  return (
    <svg className={`net-logo ${className}`} viewBox="0 0 38 24" fill="none">
      <circle cx="14" cy="12" r="12" fill="#EB001B" opacity="0.95" />
      <circle cx="24" cy="12" r="12" fill="#F79E1B" opacity="0.95" />
      <path
        d="M19 4.8C21.2 6.7 22.6 9.2 22.6 12s-1.4 5.3-3.6 7.2C13.8 17.3 12.4 14.8 12.4 12s1.4-5.3 3.6-7.2H19z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg className="card-chip" viewBox="0 0 42 32" fill="none">
      <rect x="1" y="1" width="40" height="30" rx="5" fill="#D4AF37" stroke="#B89820" strokeWidth="0.5" />
      <rect x="14" y="1" width="14" height="30" fill="#C4A020" opacity="0.7" />
      <rect x="1" y="11" width="40" height="10" fill="#C4A020" opacity="0.7" />
      <rect x="14" y="11" width="14" height="10" fill="#B89020" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PaymentModal({ orderId, totalAmount, orderNumber, onSuccess, onClose }) {
  const [tab, setTab] = useState("card"); // card | apple | google
  const [form, setForm] = useState({ cardNumber: "", cardholderName: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const [cvvVisible, setCvvVisible] = useState(false);
  // status: idle | processing | success | failed
  const [status, setStatus] = useState("idle");
  const [transactionId, setTransactionId] = useState("");

  const network = detectCardNetwork(form.cardNumber);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && status === "idle") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCardNumber = (e) => {
    setForm((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }));
    setErrors((p) => ({ ...p, cardNumber: "" }));
  };

  const handleExpiry = (e) => {
    setForm((p) => ({ ...p, expiry: formatExpiry(e.target.value) }));
    setErrors((p) => ({ ...p, expiry: "" }));
  };

  const handleCvv = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setForm((p) => ({ ...p, cvv: val }));
    setErrors((p) => ({ ...p, cvv: "" }));
  };

  const handleName = (e) => {
    setForm((p) => ({ ...p, cardholderName: e.target.value.toUpperCase() }));
    setErrors((p) => ({ ...p, cardholderName: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validErrors } = validateCard(form);
    if (!isValid) { setErrors(validErrors); return; }

    setStatus("processing");

    const digits = form.cardNumber.replace(/\s/g, "");
    const decline = shouldDecline(form.cardNumber, form.cvv);

    console.log("[Payment] card (masked):", `****${digits.slice(-4)}`);
    console.log("[Payment] network:", network);
    console.log("[Payment] shouldDecline:", decline);

    try {
      // Step 1: Initialize payment session
      // Uses POST /api/orders/{id}/payment/init (OrdersController)
      // TODO (production): Replace with Stripe/Kaspi/CloudPayments session initiation
      const initRes = await initOrderPayment(orderId, { paymentMethod: "card" });
      console.log("[Payment] initiate response:", initRes);

      // Simulate bank authorization delay (mock only)
      await new Promise((r) => setTimeout(r, 1800));

      if (decline) {
        // Step 2a: Decline — uses POST /api/orders/{id}/payment/mock-fail
        // TODO (production): Real decline comes from provider's error response
        const failRes = await mockPaymentFail(orderId);
        console.log("[Payment] mock-fail response:", failRes);
        console.log("[Payment] final paymentStatus:", failRes?.paymentStatus);
        setStatus("failed");
      } else {
        // Step 2b: Success — uses POST /api/orders/{id}/payment/mock-success
        // TODO (production): Real confirm via stripe.confirmCardPayment() / provider capture
        const successRes = await mockPaymentSuccess(orderId);
        console.log("[Payment] mock-success response:", successRes);
        console.log("[Payment] final paymentStatus:", successRes?.paymentStatus);
        setTransactionId(successRes?.externalPaymentId || successRes?.paymentSessionId || "");
        setStatus("success");
      }
    } catch (err) {
      console.error("[Payment] API error:", err);
      setStatus("failed");
    }
  };

  const handleDone = () => {
    if (status === "success") onSuccess(orderId);
    else setStatus("idle");
  };

  // Virtual card display values
  const cardDisplay = form.cardNumber
    ? form.cardNumber.padEnd(19, " ").slice(0, 19)
    : "•••• •••• •••• ••••";
  const nameDisplay = form.cardholderName || "CARDHOLDER NAME";
  const expiryDisplay = form.expiry || "MM/YY";

  return (
    <div
      className="pm-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && status === "idle") onClose(); }}
    >
      <div className="pm-modal" role="dialog" aria-modal="true" aria-label="Форма оплаты">

        {/* ── Processing screen ── */}
        {status === "processing" && (
          <div className="pm-status-screen">
            <div className="pm-loader">
              <div className="pm-loader__ring" />
              <div className="pm-loader__ring pm-loader__ring--inner" />
            </div>
            <h3 className="pm-status-title">Обрабатываем платёж...</h3>
            <p className="pm-status-sub">Пожалуйста, подождите</p>
          </div>
        )}

        {/* ── Success screen ── */}
        {status === "success" && (
          <div className="pm-status-screen">
            <div className="pm-status-icon pm-status-icon--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="pm-status-title">Оплата прошла!</h3>
            <p className="pm-status-sub">Заказ #{orderNumber} успешно оплачен</p>
            {transactionId && (
              <div className="pm-txn-id">
                <span>ID транзакции</span>
                <code>{transactionId.slice(0, 24)}…</code>
              </div>
            )}
            <button className="pm-done-btn" onClick={handleDone}>
              Перейти к заказу
            </button>
          </div>
        )}

        {/* ── Failed screen ── */}
        {status === "failed" && (
          <div className="pm-status-screen">
            <div className="pm-status-icon pm-status-icon--failed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h3 className="pm-status-title">Платёж отклонён</h3>
            <p className="pm-status-sub">Проверьте данные карты и попробуйте снова</p>
            <div className="pm-test-hint">
              <InfoIcon />
              <div>
                <strong>Тестовые карты:</strong>
                <div><code>4242 4242 4242 4242</code> — успешная оплата</div>
                <div><code>4000 0000 0000 0002</code> — отказ банка</div>
                <div>CVV <code>000</code> — отказ банка</div>
              </div>
            </div>
            <button className="pm-done-btn pm-done-btn--retry" onClick={handleDone}>
              Попробовать снова
            </button>
          </div>
        )}

        {/* ── Idle / form ── */}
        {status === "idle" && (
          <>
            {/* Header */}
            <div className="pm-header">
              <div className="pm-secure-badge">
                <LockIcon />
                Безопасная оплата
              </div>
              <button className="pm-close" onClick={onClose} aria-label="Закрыть">
                <CloseIcon />
              </button>
            </div>

            {/* Amount */}
            <div className="pm-amount-bar">
              <span className="pm-amount-bar__label">К оплате</span>
              <span className="pm-amount-bar__value">
                {Number(totalAmount).toLocaleString("ru-RU")} ₸
              </span>
            </div>

            {/* Method tabs */}
            <div className="pm-tabs">
              <button
                className={`pm-tab ${tab === "card" ? "pm-tab--active" : ""}`}
                onClick={() => setTab("card")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Карта
              </button>
              <button
                className={`pm-tab ${tab === "apple" ? "pm-tab--active" : ""}`}
                onClick={() => setTab("apple")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.22.14-2.22 1.3-2.2 3.88.03 3.06 2.68 4.07 2.71 4.08-.03.07-.42 1.44-1.38 2.61M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple Pay
              </button>
              <button
                className={`pm-tab ${tab === "google" ? "pm-tab--active" : ""}`}
                onClick={() => setTab("google")}
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.17 22.56 15.44 22.56 12.25z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google Pay
              </button>
            </div>

            {/* ── Card form ── */}
            {tab === "card" && (
              <form onSubmit={handleSubmit} className="pm-form" noValidate>
                {/* Virtual card */}
                <div className={`pm-card pm-card--${network}`}>
                  <div className="pm-card__top">
                    <ChipIcon />
                    <div className="pm-card__net">
                      {network === "visa" && <VisaLogo className="pm-card__net-logo" />}
                      {network === "mastercard" && <MasterCardLogo className="pm-card__net-logo" />}
                    </div>
                  </div>
                  <div className="pm-card__number">{cardDisplay}</div>
                  <div className="pm-card__bottom">
                    <div>
                      <div className="pm-card__label">Владелец</div>
                      <div className="pm-card__val">{nameDisplay}</div>
                    </div>
                    <div>
                      <div className="pm-card__label">Действует до</div>
                      <div className="pm-card__val">{expiryDisplay}</div>
                    </div>
                  </div>
                </div>

                {/* Card number field */}
                <div className="pm-field">
                  <label className="pm-label">Номер карты</label>
                  <div className="pm-input-wrap">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="0000 0000 0000 0000"
                      value={form.cardNumber}
                      onChange={handleCardNumber}
                      maxLength={19}
                      className={errors.cardNumber ? "pm-input pm-input--err" : "pm-input"}
                    />
                    <span className="pm-input__badge">
                      {network === "visa" && <VisaLogo />}
                      {network === "mastercard" && <MasterCardLogo />}
                    </span>
                  </div>
                  {errors.cardNumber && <span className="pm-err">{errors.cardNumber}</span>}
                </div>

                {/* Cardholder name */}
                <div className="pm-field">
                  <label className="pm-label">Имя владельца</label>
                  <input
                    type="text"
                    autoComplete="cc-name"
                    placeholder="IVAN IVANOV"
                    value={form.cardholderName}
                    onChange={handleName}
                    className={errors.cardholderName ? "pm-input pm-input--err" : "pm-input"}
                  />
                  {errors.cardholderName && <span className="pm-err">{errors.cardholderName}</span>}
                </div>

                {/* Expiry + CVV row */}
                <div className="pm-row">
                  <div className="pm-field">
                    <label className="pm-label">Срок действия</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={form.expiry}
                      onChange={handleExpiry}
                      maxLength={5}
                      className={errors.expiry ? "pm-input pm-input--err" : "pm-input"}
                    />
                    {errors.expiry && <span className="pm-err">{errors.expiry}</span>}
                  </div>

                  <div className="pm-field">
                    <label className="pm-label">
                      CVV / CVC
                      <span className="pm-cvv-hint" title="3 цифры на обороте карты">
                        <InfoIcon />
                      </span>
                    </label>
                    <div className="pm-input-wrap">
                      <input
                        type={cvvVisible ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="•••"
                        value={form.cvv}
                        onChange={handleCvv}
                        maxLength={4}
                        className={errors.cvv ? "pm-input pm-input--err" : "pm-input"}
                      />
                      <button
                        type="button"
                        className="pm-cvv-toggle"
                        onClick={() => setCvvVisible((p) => !p)}
                        aria-label={cvvVisible ? "Скрыть CVV" : "Показать CVV"}
                      >
                        {cvvVisible ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.cvv && <span className="pm-err">{errors.cvv}</span>}
                  </div>
                </div>

                <button type="submit" className="pm-pay-btn">
                  Оплатить {Number(totalAmount).toLocaleString("ru-RU")} ₸
                </button>

                <p className="pm-secure-note">
                  <LockIcon />
                  Данные защищены SSL-шифрованием · Demo / Mock mode
                </p>

                {/* Test card hint */}
                <details className="pm-test-cards">
                  <summary>Тестовые данные карты</summary>
                  <div className="pm-test-cards__body">
                    <div className="pm-test-row">
                      <span>Успешная оплата:</span>
                      <code>4242 4242 4242 4242</code>
                    </div>
                    <div className="pm-test-row">
                      <span>Отказ банка:</span>
                      <code>4000 0000 0000 0002</code>
                    </div>
                    <div className="pm-test-row">
                      <span>Срок / CVV:</span>
                      <code>любые / 123</code>
                    </div>
                  </div>
                </details>
              </form>
            )}

            {/* ── Apple Pay UI ── */}
            {tab === "apple" && (
              <div className="pm-wallet">
                <div className="pm-wallet__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.22.14-2.22 1.3-2.2 3.88.03 3.06 2.68 4.07 2.71 4.08-.03.07-.42 1.44-1.38 2.61M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <h3>Apple Pay</h3>
                <p>Доступен на устройствах Apple с настроенным Apple Wallet.</p>
                <div className="pm-demo-notice">
                  <InfoIcon />
                  {/* TODO: Integrate Apple Pay via stripe.paymentRequest() or Apple Pay JS API */}
                  Demo — реальный Apple Pay требует Apple Developer аккаунта и верифицированного домена
                </div>
                <button className="pm-alt-btn" onClick={() => setTab("card")}>
                  Оплатить картой
                </button>
              </div>
            )}

            {/* ── Google Pay UI ── */}
            {tab === "google" && (
              <div className="pm-wallet">
                <div className="pm-wallet__icon pm-wallet__icon--google">
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.17 22.56 15.44 22.56 12.25z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <h3>Google Pay</h3>
                <p>Оплата через сохранённые карты в Google аккаунте.</p>
                <div className="pm-demo-notice">
                  <InfoIcon />
                  {/* TODO: Integrate Google Pay via Google Pay API or Stripe paymentRequest() */}
                  Demo — реальный Google Pay требует Google Pay API и верифицированного merchant ID
                </div>
                <button className="pm-alt-btn" onClick={() => setTab("card")}>
                  Оплатить картой
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
