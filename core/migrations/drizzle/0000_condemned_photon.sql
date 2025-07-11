CREATE TABLE "code_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"file_path" varchar(512) NOT NULL,
	"start_line" integer NOT NULL,
	"end_line" integer NOT NULL,
	"node_type" varchar(100) NOT NULL,
	"function_name" varchar(255),
	"class_name" varchar(255),
	"language" varchar(50) NOT NULL,
	"hash" varchar(64) NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "code_chunks_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chunk_id" uuid NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "embeddings_chunk_id_unique" UNIQUE("chunk_id")
);
--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_chunk_id_code_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."code_chunks"("id") ON DELETE cascade ON UPDATE no action;