export interface FileMetaData{
    id : string,
    name: string,
    size: number,
    file : File,
    url : string = '',

    constructor (file: File)
    {
        this.file = file;
    }
}