import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFilesChange: (files: { name: string; url: string; size: number }[]) => void;
  existingFiles?: { name: string; url: string; size: number }[];
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function FileUpload({ 
  onFilesChange, 
  existingFiles = [], 
  maxFiles = 5, 
  maxSize = 10 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<{ name: string; url: string; size: number }[]>(existingFiles);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Máximo de ${maxFiles} arquivos permitidos`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newFiles: { name: string; url: string; size: number }[] = [];

    for (const file of acceptedFiles) {
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${maxSize}MB`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `anexos/${fileName}`;

        const { data, error } = await supabase.storage
          .from('anexos')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('anexos')
          .getPublicUrl(filePath);

        newFiles.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Erro no upload",
          description: `Falha ao enviar ${file.name}`,
          variant: "destructive",
        });
      }
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setUploading(false);
  }, [files, maxFiles, maxSize, onFilesChange, toast]);

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: uploading || files.length >= maxFiles,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading || files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          {isDragActive 
            ? 'Solte os arquivos aqui...' 
            : 'Arraste arquivos ou clique para selecionar'
          }
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOC, DOCX, PNG, JPG até {maxSize}MB cada
        </p>
        {uploading && (
          <p className="text-sm text-primary mt-2">Enviando arquivos...</p>
        )}
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Arquivos anexados:</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {files.length >= maxFiles && (
        <div className="flex items-center space-x-2 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Limite máximo de {maxFiles} arquivos atingido</span>
        </div>
      )}
    </div>
  );
}