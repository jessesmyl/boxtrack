-- CreateTable
CREATE TABLE "Move" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'ON',
    "fromAddr" TEXT,
    "toAddr" TEXT,
    "homeSize" TEXT,
    "moveDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL,
    "moveId" TEXT NOT NULL,
    "label" INTEGER NOT NULL,
    "room" TEXT,
    "category" TEXT,
    "fragile" BOOLEAN NOT NULL DEFAULT false,
    "fillLevel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "boxId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "boxId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Box_moveId_label_key" ON "Box"("moveId", "label");

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE CASCADE ON UPDATE CASCADE;
