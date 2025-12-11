
export class BitBuffer {
    private buffer: Uint8Array;
    private capacity: number;
    private byteOffset: number = 0;
    private bitOffset: number = 0;

    constructor(size: number = 4096) {
        this.capacity = size;
        this.buffer = new Uint8Array(size);
    }

    private ensureCapacity(bitsToAdd: number) {
        const totalBits = (this.byteOffset * 8) + this.bitOffset + bitsToAdd;
        const neededBytes = Math.ceil(totalBits / 8);
        if (neededBytes > this.capacity) {
            const newCap = Math.max(this.capacity * 2, neededBytes + 128);
            const newBuf = new Uint8Array(newCap);
            newBuf.set(this.buffer);
            this.buffer = newBuf;
            this.capacity = newCap;
        }
    }

    public writeBit(bit: number) {
        this.ensureCapacity(1);
        if (bit) {
            this.buffer[this.byteOffset] |= (1 << this.bitOffset);
        } else {
            this.buffer[this.byteOffset] &= ~(1 << this.bitOffset);
        }
        this.bitOffset++;
        if (this.bitOffset === 8) {
            this.bitOffset = 0;
            this.byteOffset++;
        }
    }

    public writeBits(value: number, count: number) {
        for (let i = 0; i < count; i++) {
            this.writeBit((value >> i) & 1);
        }
    }

    public writeVarInt(value: number) {
        let val = Math.floor(Math.max(0, value));
        do {
            let byte = val & 0x7F;
            val >>>= 7;
            if (val !== 0) {
                byte |= 0x80;
            }
            this.writeBits(byte, 8);
        } while (val !== 0);
    }
    
    public writeString(str: string) {
        // Simple ASCII/UTF8 approximation for save data IDs
        this.writeVarInt(str.length);
        for(let i=0; i<str.length; i++) {
            this.writeVarInt(str.charCodeAt(i));
        }
    }

    public resetReading() {
        this.byteOffset = 0;
        this.bitOffset = 0;
    }

    public readBit(): number {
        if (this.byteOffset >= this.capacity) return 0;
        const bit = (this.buffer[this.byteOffset] >> this.bitOffset) & 1;
        this.bitOffset++;
        if (this.bitOffset === 8) {
            this.bitOffset = 0;
            this.byteOffset++;
        }
        return bit;
    }

    public readBits(count: number): number {
        let value = 0;
        for (let i = 0; i < count; i++) {
            value |= (this.readBit() << i);
        }
        return value;
    }

    public readVarInt(): number {
        let result = 0;
        let shift = 0;
        while (true) {
            const byte = this.readBits(8);
            result |= (byte & 0x7F) << shift;
            shift += 7;
            if ((byte & 0x80) === 0) break;
            if (shift > 35) break; // Safety break
        }
        return result;
    }

    public readString(): string {
        const len = this.readVarInt();
        let str = "";
        for(let i=0; i<len; i++) {
            str += String.fromCharCode(this.readVarInt());
        }
        return str;
    }

    public toBase64(): string {
        const length = this.byteOffset + (this.bitOffset > 0 ? 1 : 0);
        const sub = this.buffer.subarray(0, length);
        let binary = '';
        const len = sub.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(sub[i]);
        }
        return btoa(binary);
    }

    public fromBase64(str: string) {
        try {
            const binary = atob(str);
            this.capacity = binary.length;
            this.buffer = new Uint8Array(this.capacity);
            for (let i = 0; i < this.capacity; i++) {
                this.buffer[i] = binary.charCodeAt(i);
            }
            this.resetReading();
        } catch (e) {
            console.error("BitBuffer decode failed", e);
            this.capacity = 0;
            this.buffer = new Uint8Array(0);
        }
    }
}
