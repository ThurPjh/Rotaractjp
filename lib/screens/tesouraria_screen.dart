import 'package:flutter/material.dart';
import '../models/usuario_model.dart';
import '../models/financeiro_model.dart';
import '../services/database.dart';

class TesourariaScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const TesourariaScreen({super.key, required this.usuario});

  @override
  State<TesourariaScreen> createState() => _TesourariaScreenState();
}

class _TesourariaScreenState extends State<TesourariaScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descricaoController = TextEditingController();
  final _valorController = TextEditingController();
  String _tipoTransacao = 'entrada'; // Padrão é entrada/depósito

  // Função que abre a caixinha (Dialog) para registrar Saque ou Depósito
  void _abrirFormularioLancamento(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Novo Lançamento de Caixa'),
              content: Form(
                key: _formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Seleção de Tipo: Depósito (Entrada) ou Saque (Saída)
                      DropdownButtonFormField<String>(
                        value: _tipoTransacao,
                        decoration: const InputDecoration(
                          labelText: 'Tipo de Operação',
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'entrada',
                            child: Text('Depósito (Entrada)'),
                          ),
                          DropdownMenuItem(
                            value: 'saida',
                            child: Text('Saque / Pagamento (Saída)'),
                          ),
                        ],
                        onChanged: (value) {
                          if (value != null) {
                            setStateDialog(() => _tipoTransacao = value);
                          }
                        },
                      ),
                      const SizedBox(height: 12),
                      // Campo de Descrição (Para que foi gasto/recebido)
                      TextFormField(
                        controller: _descricaoController,
                        decoration: const InputDecoration(
                          labelText: 'Descrição / Motivo',
                          hintText: 'Ex: Mensalidade Maio ou Compra de Tintas',
                        ),
                        validator: (value) => value == null || value.isEmpty
                            ? 'Insira uma descrição'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      // Campo de Valor
                      TextFormField(
                        controller: _valorController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: const InputDecoration(
                          labelText: 'Valor (R\$)',
                          hintText: '0.00',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty)
                            return 'Insira um valor';
                          if (double.tryParse(value) == null)
                            return 'Insira um número válido';
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    _descricaoController.clear();
                    _valorController.clear();
                    Navigator.pop(context);
                  },
                  child: const Text('Cancelar'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Theme.of(context).colorScheme.onPrimary,
                  ),
                  onPressed: () async {
                    if (_formKey.currentState!.validate()) {
                      // Salva no Firebase Firestore usando o serviço criado
                      await DatabaseService().addTransacao(
                        _descricaoController.text,
                        double.parse(_valorController.text),
                        _tipoTransacao,
                      );

                      _descricaoController.clear();
                      _valorController.clear();
                      if (context.mounted) Navigator.pop(context);
                    }
                  },
                  child: const Text('Confirmar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _descricaoController.dispose();
    _valorController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tesouraria e Caixa'),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
      ),
      // 🔐 TRAVA DE SEGURANÇA ATUALIZADA: Permite Presidente, Secretário e Tesoureiro
      floatingActionButton:
          (widget.usuario.cargo.toLowerCase() == 'presidente' ||
              widget.usuario.cargo.toLowerCase() == 'secretario' ||
              widget.usuario.cargo.toLowerCase() == 'tesoureiro')
          ? FloatingActionButton.extended(
              onPressed: () => _abrirFormularioLancamento(context),
              backgroundColor: theme.colorScheme.primary,
              foregroundColor: theme.colorScheme.onPrimary,
              icon: const Icon(Icons.account_balance_wallet),
              label: const Text('Novo Lançamento'),
            )
          : null,
      body: StreamBuilder<List<FinanceiroModel>>(
        stream: DatabaseService().transacoes, // Ouve o caixa em tempo real
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final movimentacoes = snapshot.data ?? [];

          // 📊 Cálculo dinâmico do saldo atual do caixa
          double saldoTotal = 0;
          for (var mov in movimentacoes) {
            if (mov.tipo == 'entrada') {
              saldoTotal += mov.valor;
            } else {
              saldoTotal -= mov.valor;
            }
          }

          return Column(
            children: [
              // 💳 CARD DO SALDO DO CAIXA
              Container(
                width: double.infinity,
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  // Fica verde se tiver dinheiro, vermelho se estiver zerado/negativo
                  color: saldoTotal >= 0
                      ? Color.fromRGBO(14, 2, 7, 0.361)
                      : Colors.red.shade800,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(color: Colors.black12, blurRadius: 8),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SALDO ATUAL DO CAIXA',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'R\$ ${saldoTotal.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Histórico de Movimentações',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),

              // 📜 LISTA HISTÓRICA DO QUE FOI GASTO / RECEBIDO
              Expanded(
                child: movimentacoes.isEmpty
                    ? const Center(
                        child: Text(
                          'Nenhuma movimentação registrada no caixa.',
                        ),
                      )
                    : ListView.builder(
                        itemCount: movimentacoes.length,
                        itemBuilder: (context, index) {
                          final mov = movimentacoes[index];
                          final isEntrada = mov.tipo == 'entrada';

                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 6,
                            ),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: isEntrada
                                    ? Colors.green.withOpacity(0.2)
                                    : Colors.red.withOpacity(0.2),
                                child: Icon(
                                  isEntrada
                                      ? Icons.arrow_upward
                                      : Icons.arrow_downward,
                                  color: isEntrada ? Colors.green : Colors.red,
                                ),
                              ),
                              title: Text(
                                mov.descricao,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              subtitle: Text(mov.data),
                              trailing: Text(
                                '${isEntrada ? "+ " : "- "}R\$ ${mov.valor.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: isEntrada ? Colors.green : Colors.red,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
