import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FileMetaData } from 'src/app/model/file-meta-data';
import { FileService } from 'src/app/shared/file.service';
import { finalize } from 'rxjs/operators';
import { empty } from 'rxjs';
import { DataService } from 'src/app/shared/data.service';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent implements OnInit{
  
  selectedFiles !: FileList;
  currentFileUpload !: FileMetaData;
  percentage: number = 0;

  listoffiles : FileMetaData[] = [];

  constructor(private fileService: FileService, private fireStorage:AngularFireStorage, private dataService : DataService) {}

  ngOnInit(): void {
    this.getAllFiles();

  }

  selectFile(event : any)
  {
    this.selectedFiles = event.target.files;
  }

  uploadFiles()
  {
    this.currentFileUpload = new FileMetaData(this.selectedFiles[0]);
    const path = 'Uploads/'+this.currentFileUpload.file.name;

    const storageRef = this.fireStorage.ref(path);
    const uploadTask = storageRef.put(this.selectedFiles[0]);

    uploadTask.snapshotChanges().pipe(finalize( ()=> {
      storageRef.getDownloadURL().subscribe(downloadLink =>{
        this.currentFileUpload.id = '';
        this.currentFileUpload.url = downloadLink;
        this.currentFileUpload.size = this.currentFileUpload.file.size;
        this.currentFileUpload.name = this.currentFileUpload.file.name;

        this.fileService.saveMetaDataOfFile(this.currentFileUpload);
      })
      this.ngOnInit();
    })

    ).subscribe({ 
    next: (res : any)=>
    this.percentage = (res.bytesTransferred * 100 / res.totalBytes),
    
    error : (err) =>
    { console.log ('Error Occured ')}

    });
  
  }


  getAllFiles(){
  
    this.fileService.getAllFiles().subscribe({

      next: (res) => 
       this.listoffiles = res.map((e: any) => {
        const data= e.payload.doc.data();
        data.id=e.payload.doc.id;
        return data;
      }),

      error: (err) =>
      { alert ('Error While fetching file meta data'); }

  })


  }

  deleteFile(file : FileMetaData)
  {
     if(window.confirm('Are you sure you want to delete '+file.name + '?'))

     {
      this.fileService.deleteFile(file);
      this.ngOnInit();
     }
  }

}
