import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Save, Languages, CheckCircle2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export default function TranslationManager() {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("es");
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Queries
  const { data: languages } = trpc.translations.getLanguages.useQuery();
  const { data: translations, isLoading } = trpc.translations.getTranslations.useQuery({
    language: selectedLanguage as any,
    search: search || undefined,
  });
  const { data: stats } = trpc.translations.getTranslationStats.useQuery();

  // Mutations
  const utils = trpc.useUtils();
  const updateTranslation = trpc.translations.updateTranslation.useMutation({
    onSuccess: () => {
      utils.translations.getTranslations.invalidate();
      utils.translations.getTranslationStats.invalidate();
      toast.success(t('translationManager.translationUpdated'));
      setEditingKey(null);
      setEditingValue("");
    },
    onError: (error) => {
      toast.error(t('translationManager.error', { message: error.message }));
    },
  });

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const handleSave = (key: string) => {
    if (editingValue.trim() === "") {
      toast.error(t('translationManager.valueCannotBeEmpty'));
      return;
    }

    updateTranslation.mutate({
      language: selectedLanguage as any,
      key,
      value: editingValue,
    });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditingValue("");
  };

  // Exportar traducciones a CSV
  const { refetch: exportTranslations } = trpc.translations.exportToCSV.useQuery(
    { languages: undefined }, // Exportar todos los idiomas
    {
      enabled: false,
      onSuccess: (data) => {
        // Crear blob y descargar
        const blob = new Blob([data.content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = data.filename;
        link.click();
        toast.success(t('translationManager.exportSuccess'));
      },
      onError: (error) => {
        toast.error(t('translationManager.exportError', { message: error.message }));
      },
    }
  );

  const handleExport = () => {
    exportTranslations();
  };

  // Importar traducciones desde CSV
  const importTranslations = trpc.translations.importFromCSV.useMutation({
    onSuccess: (data) => {
      utils.translations.getTranslations.invalidate();
      utils.translations.getTranslationStats.invalidate();
      toast.success(t('translationManager.importSuccess', { count: data.updatedCount }));
    },
    onError: (error) => {
      toast.error(t('translationManager.importError', { message: error.message }));
    },
  });

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target?.result as string;
        importTranslations.mutate({
          csvContent,
          overwrite: false,
        });
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getLanguageName = (code: string) => {
    return languages?.find(l => l.code === code)?.name || code;
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="h-8 w-8" />
            {t('translationManager.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('translationManager.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('translationManager.export')}
          </Button>
          <Button onClick={handleImport} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {t('translationManager.import')}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.language}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {getLanguageName(stat.language)}
                </CardTitle>
                {stat.percentage === 100 && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.translatedKeys}/{stat.totalKeys}
                </div>
                <p className={`text-xs ${getCompletionColor(stat.percentage)}`}>
                  {stat.percentage}% {t('translationManager.complete')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('translationManager.filters')}</CardTitle>
          <CardDescription>
            {t('translationManager.filtersDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('translationManager.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('translationManager.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {languages?.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('translationManager.translationsFor')} {getLanguageName(selectedLanguage)}
          </CardTitle>
          <CardDescription>
            {translations?.length || 0} {t('translationManager.translationsFound')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">{t('translationManager.loading')}</p>
            </div>
          ) : translations && translations.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">{t('translationManager.key')}</TableHead>
                    <TableHead>{t('translationManager.value')}</TableHead>
                    <TableHead className="w-[150px]">{t('translationManager.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translations.map((translation) => (
                    <TableRow key={translation.key}>
                      <TableCell className="font-mono text-sm">
                        <Badge variant="outline">{translation.key}</Badge>
                      </TableCell>
                      <TableCell>
                        {editingKey === translation.key ? (
                          <Input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSave(translation.key);
                              } else if (e.key === "Escape") {
                                handleCancel();
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm">{translation.value}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingKey === translation.key ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(translation.key)}
                              disabled={updateTranslation.isPending}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              {t('translationManager.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              {t('translationManager.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(translation.key, translation.value)}
                          >
                            {t('translationManager.edit')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('translationManager.noTranslationsFound')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
