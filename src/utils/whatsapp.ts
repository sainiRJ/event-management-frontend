/**
 * One-tap WhatsApp messages to customers.
 *
 * There is no WhatsApp API here - that costs money per message. A wa.me
 * link with the text pre-filled costs nothing and takes the vendor one tap:
 * WhatsApp opens on the customer's chat with the message ready to send.
 */

function digitsOnly(phone: string): string {
	const digits = phone.replace(/\D/g, "");
	// Indian numbers typed without a country code.
	return digits.length === 10 ? `91${digits}` : digits;
}

export function whatsappLink(phone: string, text: string): string {
	return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(text)}`;
}

function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function rupees(amount: number): string {
	return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

interface iBookingFacts {
	customerName: string;
	serviceName: string;
	eventDate: string | Date;
	location?: string;
}

/** "We've got your request, will call soon." */
export function requestReceivedMessage(facts: iBookingFacts): string {
	return [
		`Namaste ${facts.customerName} ji, Saini Events here.`,
		`We received your request for ${facts.serviceName} on ${formatDate(
			facts.eventDate,
		)}${facts.location ? ` at ${facts.location}` : ""}.`,
		"We'll call you shortly to confirm the price and hold the date.",
	].join("\n");
}

/** "Confirmed, here's the money." */
export function bookingConfirmedMessage(
	facts: iBookingFacts & {totalCost: number; advancePayment: number},
): string {
	const due = Math.max(0, facts.totalCost - facts.advancePayment);
	return [
		`Namaste ${facts.customerName} ji, Saini Events here.`,
		`Your ${facts.serviceName} on ${formatDate(
			facts.eventDate,
		)} is confirmed. The date is held for you.`,
		`Total: ${rupees(facts.totalCost)}`,
		facts.advancePayment > 0
			? `Advance received: ${rupees(facts.advancePayment)}`
			: "",
		`Due on the day: ${rupees(due)} (cash or UPI)`,
		"Thank you for choosing us.",
	]
		.filter(Boolean)
		.join("\n");
}

/** "Sorry, can't do that date." */
export function bookingDeclinedMessage(facts: iBookingFacts): string {
	return [
		`Namaste ${facts.customerName} ji, Saini Events here.`,
		`We're sorry, we can't take ${facts.serviceName} on ${formatDate(
			facts.eventDate,
		)} - that date is already booked for this setup.`,
		"If your date is flexible, tell us and we'll do our best.",
	].join("\n");
}

/** The itemised quote, with its one-time link. */
export function quoteMessage(
	facts: iBookingFacts & {total: number; quoteUrl: string},
): string {
	return [
		`Namaste ${facts.customerName} ji, Saini Events here.`,
		`Here is your quote for ${facts.serviceName} on ${formatDate(
			facts.eventDate,
		)}: ${rupees(facts.total)} in total.`,
		"See the full breakdown and accept it here:",
		facts.quoteUrl,
	].join("\n");
}

/** After the event: the one-time review link. */
export function reviewRequestMessage(
	facts: iBookingFacts & {reviewUrl: string},
): string {
	return [
		`Namaste ${facts.customerName} ji, Saini Events here.`,
		`Thank you for having us do the ${facts.serviceName} on ${formatDate(
			facts.eventDate,
		)}. We hope everything went beautifully.`,
		"If you have a minute, a few words about how it went would mean a lot:",
		facts.reviewUrl,
	].join("\n");
}

/** Nudge for money still owed after the event. */
export function paymentReminderMessage(
	facts: iBookingFacts & {amountDue: number},
): string {
	return [
		`Namaste ${facts.customerName} ji, Saini Events here.`,
		`A gentle reminder: ${rupees(facts.amountDue)} is still due for the ${
			facts.serviceName
		} on ${formatDate(facts.eventDate)}.`,
		"Cash or UPI, whichever is easier. Thank you!",
	].join("\n");
}
