import 'package:flutter/material.dart';
import '../services/database.dart';

class FormEventoScreen extends StatefulWidget {
  @override
  _FormEventoScreenState createState() => _FormEventoScreenState();
}

class _FormEventoScreenState extends State<FormEventoScreen> {
  final _nomeController = TextEditingController();
  final _descController = TextEditingController();
  DateTime _dataSelecionada = DateTime.now();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Novo Evento")),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _nomeController,
              decoration: InputDecoration(labelText: "Nome do Evento"),
            ),
            TextField(
              controller: _descController,
              decoration: InputDecoration(labelText: "Descrição"),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                await DatabaseService().addEvento(
                  _nomeController.text,
                  _descController.text,
                  _dataSelecionada,
                );
                Navigator.pop(context); // Volta para a tela anterior
              },
              child: Text("Salvar Evento"),
            ),
          ],
        ),
      ),
    );
  }
}