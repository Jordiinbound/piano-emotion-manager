ALTER TABLE `invoices` ADD `paymentToken` varchar(64);--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_paymentToken_unique` UNIQUE(`paymentToken`);