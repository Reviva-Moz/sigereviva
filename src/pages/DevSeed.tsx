import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface SeedUserRow {
  email: string;
  password: string;
  role: string;
  status?: string;
}

const DevSeed: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<SeedUserRow[] | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-users", {
        method: "POST",
      });
      if (error) throw error;

      if (data?.ok) {
        const mapped = (data.credentials as any[]).map((u: any) => ({
          email: u.email,
          password: u.password,
          role: u.role,
        }));
        setRows(mapped);
        toast.success("Usuários de teste prontos! Use as credenciais abaixo para entrar.");
      } else {
        throw new Error(data?.error || "Falha desconhecida ao semear usuários");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao criar usuários de teste");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Seed de Usuários de Teste
          </CardTitle>
          <CardDescription>
            Cria 4 contas (DIRETORIA, SECRETARIA, FINANCEIRO, PROFESSOR) com senha 123456 e prepara seus perfis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <Button onClick={handleSeed} disabled={loading} className="btn-hero">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Criando...
                </span>
              ) : (
                "Criar usuários de teste"
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Ir para Login</Link>
            </Button>
          </div>

          {rows && (
            <Table>
              <TableCaption>Use estas credenciais para entrar no sistema.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Senha</TableHead>
                  <TableHead>Papel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.email}>
                    <TableCell className="font-medium">{r.email}</TableCell>
                    <TableCell>
                      <code className="px-1.5 py-0.5 rounded bg-muted">{r.password}</code>
                    </TableCell>
                    <TableCell>{r.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default DevSeed;
