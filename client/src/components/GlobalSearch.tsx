import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Search, FileText, Users, Music, Wrench, Receipt, Package, Home } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { trpc } from '@/lib/trpc';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Atajos de teclado Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Buscar clientes
  const { data: clientes } = trpc.clientes.getAll.useQuery(
    { search: searchQuery },
    { enabled: open && searchQuery.length > 0 }
  );

  // Buscar pianos
  const { data: pianos } = trpc.pianos.getAll.useQuery(
    { search: searchQuery },
    { enabled: open && searchQuery.length > 0 }
  );

  // Buscar servicios
  const { data: servicios } = trpc.servicios.getAll.useQuery(
    { search: searchQuery },
    { enabled: open && searchQuery.length > 0 }
  );

  // Buscar facturas
  const { data: facturas } = trpc.invoices.getAll.useQuery(
    { search: searchQuery },
    { enabled: open && searchQuery.length > 0 }
  );

  // Buscar inventario
  const { data: inventario } = trpc.inventario.getAll.useQuery(
    { search: searchQuery },
    { enabled: open && searchQuery.length > 0 }
  );

  const handleSelect = (href: string) => {
    setOpen(false);
    setLocation(href);
    setSearchQuery('');
  };

  // Páginas principales
  const mainPages = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Pianos', href: '/pianos', icon: Music },
    { name: 'Servicios', href: '/servicios', icon: Wrench },
    { name: 'Facturación', href: '/facturacion', icon: Receipt },
    { name: 'Inventario', href: '/inventario', icon: Package },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full max-w-md px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md hover:bg-accent transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar clientes, pianos, servicios..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>

          {searchQuery.length === 0 && (
            <CommandGroup heading="Páginas">
              {mainPages.map((page) => (
                <CommandItem
                  key={page.href}
                  onSelect={() => handleSelect(page.href)}
                >
                  <page.icon className="mr-2 h-4 w-4" />
                  <span>{page.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {clientes && clientes.length > 0 && (
            <CommandGroup heading="Clientes">
              {clientes.slice(0, 5).map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  onSelect={() => handleSelect(`/clientes/${cliente.id}/editar`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{cliente.nombre}</span>
                  {cliente.telefono && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {cliente.telefono}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {pianos && pianos.length > 0 && (
            <CommandGroup heading="Pianos">
              {pianos.slice(0, 5).map((piano) => (
                <CommandItem
                  key={piano.id}
                  onSelect={() => handleSelect(`/pianos/${piano.id}/editar`)}
                >
                  <Music className="mr-2 h-4 w-4" />
                  <span>{piano.marca} {piano.modelo}</span>
                  {piano.numeroSerie && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {piano.numeroSerie}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {servicios && servicios.length > 0 && (
            <CommandGroup heading="Servicios">
              {servicios.slice(0, 5).map((servicio) => (
                <CommandItem
                  key={servicio.id}
                  onSelect={() => handleSelect(`/servicios/${servicio.id}/editar`)}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  <span>{servicio.tipo}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(servicio.fecha).toLocaleDateString()}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {facturas && facturas.length > 0 && (
            <CommandGroup heading="Facturas">
              {facturas.slice(0, 5).map((factura) => (
                <CommandItem
                  key={factura.id}
                  onSelect={() => handleSelect(`/facturacion/${factura.id}/editar`)}
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  <span>Factura #{factura.numero}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    €{factura.total}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {inventario && inventario.length > 0 && (
            <CommandGroup heading="Inventario">
              {inventario.slice(0, 5).map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(`/inventario/${item.id}/editar`)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>{item.nombre}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Stock: {item.cantidad}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
