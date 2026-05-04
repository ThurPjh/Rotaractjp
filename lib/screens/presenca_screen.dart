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
  // Lista que armazena os IDs dos membros selecionados
  List<String> _selecionados = [];

  @override
  void initState() {
    super.initState();
    // Inicia com quem já estava marcado no banco
    _selecionados = List.from(widget.evento.presencas);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Presença: ${widget.evento.nome}"),
        actions: [
          IconButton(
            icon: const Icon(Icons.check_circle),
            onPressed: () async {
              // ENVIA OS 3 ARGUMENTOS: ID, LISTA e NOME
              await DatabaseService().marcarPresenca(
                widget.evento.id,
                _selecionados,
                widget.evento.nome,
              );
              if (mounted) Navigator.pop(context);
            },
          )
        ],
      ),
      body: StreamBuilder<List<UsuarioModel>>(
        stream: DatabaseService().membros,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

          final membros = snapshot.data!;

          return ListView.builder(
            itemCount: membros.length,
            itemBuilder: (context, index) {
              final membro = membros[index];
              final isSelected = _selecionados.contains(membro.uid);

              return CheckboxListTile(
                title: Text(membro.nome),
                subtitle: Text(membro.email),
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
      floatingActionButton: FloatingActionButton.extended(
        label: const Text("Salvar Presença"),
        icon: const Icon(Icons.save),
        onPressed: () async {
          await DatabaseService().marcarPresenca(
            widget.evento.id,
            _selecionados,
            widget.evento.nome,
          );
          if (mounted) Navigator.pop(context);
        },
      ),
    );
  }
}