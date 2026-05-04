import 'package:flutter/material.dart';
import '../models/usuario_model.dart';
import '../models/ata_model.dart';
import '../models/evento_model.dart';
import '../services/database.dart';

class HomeScreen extends StatelessWidget {
  final UsuarioModel usuario;

  const HomeScreen({super.key, required this.usuario});

  @override
  Widget build(BuildContext context) {
    // Lógica para as iniciais (mesma de antes)
    String iniciais = usuario.nome.isNotEmpty ? usuario.nome[0].toUpperCase() : "U";
    final Color corPrimaria = Theme.of(context).primaryColor;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // CABEÇALHO (Dinâmico com dados do usuário)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(20, 60, 20, 30),
          decoration: BoxDecoration(
            color: corPrimaria,
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
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Rotaract João Pinheiro',
                    style: TextStyle(fontSize: 14, color: Colors.white70),
                  ),
                ],
              ),
              CircleAvatar(
                radius: 25,
                backgroundColor: Colors.amber[300],
                child: Text(
                  iniciais,
                  style: TextStyle(color: corPrimaria, fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 25),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'NOTIFICAÇÕES ',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2),
          ),
        ),

        const SizedBox(height: 10),

        // BUSCA DE DADOS REAIS DO FIREBASE
        Expanded(
          child: StreamBuilder<List<AtaModel>>(
            stream: DatabaseService().atas,
            builder: (context, ataSnapshot) {
              return StreamBuilder<List<Evento>>(
                stream: DatabaseService().eventos,
                builder: (context, eventoSnapshot) {
                  
                  List<Widget> notificacoes = [];

                  // 1. Notificação de Ata Real
                  if (ataSnapshot.hasData && ataSnapshot.data!.isNotEmpty) {
                    final ultimaAta = ataSnapshot.data!.first;
                    notificacoes.add(_buildNotificacaoItem(
                      corBolinha: Colors.blue,
                      titulo: 'Ata publicada: ${ultimaAta.titulo}',
                      subtitulo: 'Registrada em ${ultimaAta.data}',
                    ));
                  }

                  // 2. Notificação de Evento Real
                  if (eventoSnapshot.hasData && eventoSnapshot.data!.isNotEmpty) {
                    final proximoEvento = eventoSnapshot.data!.first;
                    notificacoes.add(_buildNotificacaoItem(
                      corBolinha: Colors.orange,
                      titulo: 'Próximo Evento: ${proximoEvento.nome}',
                      subtitulo: 'Data: ${proximoEvento.descricao}', // ou use o campo de data se tiver
                    ));
                  }

                  // 3. Notificação fixa de sistema (opcional)
                  notificacoes.add(_buildNotificacaoItem(
                    corBolinha: Colors.green,
                    titulo: 'Status do Clube',
                    subtitulo: 'Seu cadastro como ${usuario.cargo} está ativo',
                    mostrarLinha: false,
                  ));

                  if (notificacoes.isEmpty) {
                    return const Center(child: Text("Sem notificações no momento."));
                  }

                  return ListView(children: notificacoes);
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNotificacaoItem({
    required Color corBolinha,
    required String titulo,
    required String subtitulo,
    bool mostrarLinha = true,
  }) {
    return Column(
      children: [
        ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          leading: Container(
            width: 12, height: 12,
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(color: corBolinha, shape: BoxShape.circle),
          ),
          title: Text(titulo, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          subtitle: Text(subtitulo, style: const TextStyle(color: Colors.grey, fontSize: 14)),
        ),
        if (mostrarLinha)
          const Divider(color: Colors.black12, indent: 20, endIndent: 20, height: 1),
      ],
    );
  }
}