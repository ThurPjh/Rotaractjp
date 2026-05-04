import 'package:flutter/material.dart';
import '../services/database.dart';
import 'package:intl/intl.dart'; 

class FormEventoScreen extends StatefulWidget {
  const FormEventoScreen({super.key});

  @override
  _FormEventoScreenState createState() => _FormEventoScreenState();
}

class _FormEventoScreenState extends State<FormEventoScreen> {
  final _nomeController = TextEditingController();
  final _descController = TextEditingController();
  DateTime _dataSelecionada = DateTime.now();

  // Função para abrir o calendário do Flutter
  Future<void> _selecionarData(BuildContext context) async {
    final DateTime? selecionada = await showDatePicker(
      context: context,
      initialDate: _dataSelecionada,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: Theme.of(context).primaryColor, // Seu rosa oficial
            ),
          ),
          child: child!,
        );
      },
    );
    if (selecionada != null && selecionada != _dataSelecionada) {
      setState(() {
        _dataSelecionada = selecionada;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Novo Evento")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _nomeController,
              decoration: const InputDecoration(
                labelText: "Nome do Evento",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 15),
            TextField(
              controller: _descController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Descrição",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 15),
            
            // Seletor de Data Visual
            ListTile(
              title: const Text("Data do Evento:"),
              subtitle: Text(DateFormat('dd/MM/yyyy').format(_dataSelecionada)),
              leading: const Icon(Icons.calendar_today),
              trailing: const Icon(Icons.edit),
              onTap: () => _selecionarData(context),
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: Colors.grey, width: 0.5),
                borderRadius: BorderRadius.circular(5),
              ),
            ),
            
            const SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 15),
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
              ),
              onPressed: () async {
                if (_nomeController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Dê um nome ao evento!")),
                  );
                  return;
                }

                await DatabaseService().addEvento(
                  _nomeController.text,
                  _descController.text,
                  _dataSelecionada,
                );
                
                if (mounted) Navigator.pop(context);
              },
              child: const Text("SALVAR EVENTO E GERAR ATA", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}