export class BluetoothPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async connect() {
    try {
      // Request Bluetooth device with printer service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Gprinter' },  // For Goojprt
          { namePrefix: 'XP' },        // For Xprinter
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Common printer service UUID
      });

      if (!this.device) {
        throw new Error('No printer selected');
      }

      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Could not connect to printer');
      }

      // Get the printer service
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      // Get the characteristic for writing data
      this.characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      return true;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      throw error;
    }
  }

  async print(data: string) {
    if (!this.characteristic) {
      throw new Error('Printer not connected');
    }

    try {
      // Convert text to printer commands
      const encoder = new TextEncoder();
      const commands = [
        '\x1B\x40',     // Initialize printer
        '\x1B\x61\x01', // Center alignment
        data,
        '\x0A\x0A\x0A', // Feed lines
        '\x1D\x56\x41', // Cut paper
      ].join('');

      const bytes = encoder.encode(commands);
      await this.characteristic.writeValue(bytes);
      return true;
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}