// src/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rotaract_app/providers/theme_provider.dart';
import 'package:rotaract_app/models/usuario_model.dart';
import 'package:rotaract_app/models/ata_model.dart';
import 'package:rotaract_app/models/evento_model.dart';
import 'package:rotaract_app/services/database.dart';
import 'package:intl/intl.dart';

class HomeScreen extends StatelessWidget {
  final UsuarioModel usuario;

  const HomeScreen({super.key, required this.usuario});

  @override
  Widget build(BuildContext context) {
    String iniciais = usuario.nome.isNotEmpty
        ? usuario.nome[0].toUpperCase()
        : "U";

    final Color corDoFundoCabecalho = Theme.of(context).colorScheme.primary;
    final Color corDoTextoEIcone = Theme.of(context).colorScheme.onPrimary;

    final themeProvider = Provider.of<ThemeProvider>(context);
    final bool isDarkMode = themeProvider.themeMode == ThemeMode.dark;

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(20, 60, 20, 30),
            decoration: BoxDecoration(
              color: corDoFundoCabecalho,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Olá, ${usuario.nome}',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: corDoTextoEIcone,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Rotaract João Pinheiro',
                      style: TextStyle(
                        fontSize: 14,
                        color: corDoTextoEIcone.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    const SizedBox(width: 8),
                    CircleAvatar(
                      radius: 25,
                      backgroundColor: Theme.of(
                        context,
                      ).colorScheme.surface.withOpacity(0.8),
                      child: Text(
                        iniciais,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onSurface,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ),Icon(isDarkMode ? Icons.dark_mode : Icons.light_mode),
                    Switch(
                      value: isDarkMode,
                      onChanged: (value) {
                        themeProvider.toggleTheme(value);
                      },
                      activeColor: corDoTextoEIcone,
                      inactiveThumbColor: Colors.grey[400],
                      inactiveTrackColor: Colors.grey[200],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 25),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'NOTIFICAÇÕES ',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color:
                    Theme.of(context).textTheme.bodySmall?.color ?? Colors.grey,
                letterSpacing: 1.2,
              ),
            ),
          ),

          const SizedBox(height: 10),

          Expanded(
            child: StreamBuilder<List<AtaModel>>(
              stream: DatabaseService().atas,
              builder: (context, ataSnapshot) {
                return StreamBuilder<List<Evento>>(
                  stream: DatabaseService().eventos,
                  builder: (eventoContext, eventoSnapshot) {
                    // Exibe um indicador de carregamento enquanto os dados do Firebase não chegam
                    if (ataSnapshot.connectionState ==
                            ConnectionState.waiting ||
                        eventoSnapshot.connectionState ==
                            ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    List<Widget> notificacoes = [];

                    // 1. Notificação de Ata
                    if (ataSnapshot.hasData && ataSnapshot.data!.isNotEmpty) {
                      final ultimaAta = ataSnapshot.data!.first;
                      // Correção do erro de digitação: 'dataFotmatada' para 'dataFormatada'
                      final dataFormatada = DateFormat(
                        'dd/MM/yyyy',
                      ).format(DateTime.now());

                      notificacoes.add(
                        _buildNotificacaoItem(
                          context:
                              eventoContext, // Passando o contexto correto para o item
                          corBolinha: Colors.blue,
                          titulo: 'Ata publicada: ${ultimaAta.titulo}',
                          subtitulo: 'Registrada em $dataFormatada',
                        ),
                      );
                    }

                    // 2. Notificação de Evento
                    if (eventoSnapshot.hasData &&
                        eventoSnapshot.data!.isNotEmpty) {
                      final proximoEvento = eventoSnapshot.data!.first;
                      notificacoes.add(
                        _buildNotificacaoItem(
                          context: eventoContext,
                          corBolinha: Colors.orange,
                          titulo: 'Próximo Evento: ${proximoEvento.nome}',
                          subtitulo:
                              'Data: ${DateFormat('dd/MM/yyyy').format(proximoEvento.data)}',
                        ),
                      );
                    }

                    // 3. Notificação Fixa de Status (Adicionada apenas se houver o usuário carregado)
                    notificacoes.add(
                      _buildNotificacaoItem(
                        context: eventoContext,
                        corBolinha: Colors.green,
                        titulo: 'Status do Clube',
                        subtitulo:
                            'Seu cadastro como ${usuario.cargo} está ativo',
                        mostrarLinha: false,
                      ),
                    );

                    // Verificação de segurança para a lista vazia
                    if (notificacoes.isEmpty) {
                      return Center(
                        child: Text(
                          "Sem notificações no momento.",
                          // Correção: Usando eventoContext para evitar conflito de escopo
                          style: Theme.of(eventoContext).textTheme.bodyMedium,
                        ),
                      );
                    }

                    return ListView(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      children: notificacoes,
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificacaoItem({
    required BuildContext context,
    required Color corBolinha,
    required String titulo,
    required String subtitulo,
    bool mostrarLinha = true,
  }) {
    return Column(
      children: [
        ListTile(
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 4,
          ),
          leading: Container(
            width: 12,
            height: 12,
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: corBolinha,
              shape: BoxShape.circle,
            ),
          ),
          // Mudança: O estilo agora herda as cores corretas do tema claro/escuro, mantendo apenas o bold local
          title: Text(
            titulo,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          // Mudança: Simplificado para usar diretamente o estilo definido no seu ThemeProvider
          subtitle: Text(
            subtitulo,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
        if (mostrarLinha)
          Divider(
            // Mudança: Adicionado o operador ?? para garantir uma cor de segurança caso o dividerTheme seja nulo
            color:
                Theme.of(context).dividerTheme.color ??
                Theme.of(context).dividerColor,
            indent: 20,
            endIndent: 20,
            height: 1,
          ),
      ],
    );
  }
}
