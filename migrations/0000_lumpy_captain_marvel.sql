CREATE TABLE `product_meta` (
	`id` text PRIMARY KEY NOT NULL,
	`meta_key` text NOT NULL,
	`meta_value` text NOT NULL,
	`product_id` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`excerpt` text,
	`content` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_meta_meta_key_idx` ON `product_meta` (`meta_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_slug_idx` ON `products` (`slug`);