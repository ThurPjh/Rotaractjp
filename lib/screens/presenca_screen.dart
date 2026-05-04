import 'package:flutter/material.dart';
import '../models/evento_model.dart';
import '../models/usuario_model.dart';
import '../services/database.dart';

class PresencaScreen extends StatefulWidget {
  final Evento evento;

  const PresencaScreen({super.key, required this.evento});

  @override
  State<PresencaScreen> createState() => _PresencaScreenState();
}

class _PresencaScreenState extends State<PresencaScreen> {
  // Lista local para controlar quem está marcado antes de salvar
  late List<String> _selecionados;

  @override
  void initState() {
    super.initState();
    // Começa com quem já estava salvo no banco
    _selecionados = List.from(widget.evento.presencas);
  }

  @override
  Widget build(BuildContext context) {
    const Color rosaOficial = Color.fromRGBO(212, 19, 103, 1);

    return Scaffold(
      appBar: AppBar(
        title: Text('Presença: ${widget.evento.nome}'),
        backgroundColor: rosaOficial,
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: () async {
              await DatabaseService().marcarPresenca(widget.evento.id, _selecionados);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Presença atualizada com sucesso!')),
              );
            },
          )
        ],
      ),
      body: StreamBuilder<List<UsuarioModel>>(
        stream: DatabaseService().membros, // Precisa criar essa stream no DatabaseService
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final membros = snapshot.data ?? [];

          return ListView.builder(
            itemCount: membros.length,
            itemBuilder: (context, index) {
              final membro = membros[index];
              final isSelected = _selecionados.contains(membro.uid);

              return CheckboxListTile(
                title: Text(membro.nome),
                subtitle: Text(membro.cargo),
                activeColor: rosaOficial,
                value: isSelected,
                onChanged: (bool? valor) {
                  setState(() {
                    if (valor == true) {
                      _selecionados.add(membro.uid);
                    } else {
                      _selecionados.remove(membro.uid);
                    }
                  });
                },
              );
            },
          );
        },
      ),
    );
  }
}