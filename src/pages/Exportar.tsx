import { useState, useRef } from "react";
import { Download, Upload, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { storage } from "@/lib/storage";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export function Exportar() {
  const { dadosAno, inicializar } = useFinanceStore();
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [dialogImportOpen, setDialogImportOpen] = useState(false);
  const [dadosImportacao, setDadosImportacao] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const anoAtual = dadosAno?.ano ?? new Date().getFullYear();

  function handleExportar() {
    try {
      const json = storage.exportarDados(anoAtual);
      if (!json) {
        setMensagem({ tipo: "erro", texto: "Erro ao exportar dados" });
        return;
      }

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fintrack_${anoAtual}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMensagem({ tipo: "sucesso", texto: `Dados exportados com sucesso! Arquivo: fintrack_${anoAtual}.json` });
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao exportar dados" });
    }
  }

  function handleImportarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const conteudo = e.target?.result as string;
      const dados = storage.importarDados(conteudo);
      
      if (!dados) {
        setMensagem({ tipo: "erro", texto: "Arquivo JSON inválido ou corrompido" });
        return;
      }

      setDadosImportacao(conteudo);
      setDialogImportOpen(true);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function confirmarImportacao() {
    if (!dadosImportacao) return;

    const dados = storage.importarDados(dadosImportacao);
    if (dados) {
      inicializar();
      setMensagem({ tipo: "sucesso", texto: `Dados importados com sucesso! Ano: ${dados.ano}` });
    } else {
      setMensagem({ tipo: "erro", texto: "Erro ao importar dados" });
    }

    setDialogImportOpen(false);
    setDadosImportacao(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <FileJson className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Exportar / Importar</h2>
          <p className="text-muted-foreground">
            Backup e restauração dos seus dados financeiros
          </p>
        </div>
      </div>

      {mensagem && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          mensagem.tipo === "sucesso" 
            ? "bg-success/10 text-success border border-success/20" 
            : "bg-destructive/10 text-destructive border border-destructive/20"
        }`}>
          {mensagem.tipo === "sucesso" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{mensagem.texto}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <Download className="h-4 w-4 text-success" />
              </div>
              Exportar Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exporte todos os seus dados financeiros do ano <strong>{anoAtual}</strong> em formato JSON.
              O arquivo inclui transações, contas, cartões, metas e configurações.
            </p>
            <Button onClick={handleExportar} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON ({anoAtual})
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              Importar Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Importe um arquivo JSON anterior para restaurar seus dados.
              <strong className="text-destructive"> Atenção:</strong> os dados atuais serão substituídos.
            </p>
            <Button 
              onClick={handleImportarClick} 
              variant="outline" 
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Arquivo JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={dialogImportOpen}
        onOpenChange={setDialogImportOpen}
        onConfirm={confirmarImportacao}
        title="Importar Dados"
        description="Tem certeza que deseja importar estes dados? Os dados atuais serão substituídos permanentemente."
      />
    </div>
  );
}
