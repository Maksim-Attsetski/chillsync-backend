import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';

class FileModule {
  async createFile(file: IFile): Promise<string> {
    try {
      const extension = file.originalname.split('.').pop();
      const fileName = uuid.v4() + '.' + extension;
      const filePath = path.resolve(__dirname, '..', '..', 'static');

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      fs.writeFileSync(path.join(filePath, fileName), file?.buffer);

      return fileName;
    } catch (error) {
      throw error;
    }
  }

  async createManyFiles(files: IFile[]): Promise<string[]> {
    try {
      const result: string[] = [];

      files.forEach(async (file) => {
        const name = await this.createFile(file);
        name && result.push(name);
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const file = path.resolve('static', fileName);
      await fs.rm(file, (err) => {
        if (err) throw err;
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteManyFiles(fileNames: string[]): Promise<void> {
    try {
      await Promise.allSettled(fileNames.map(this.deleteFile));
    } catch (error) {
      throw error;
    }
  }
}

export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export const fileModule = new FileModule();
