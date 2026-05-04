
class UsuarioModel {
  final String uid;
  final String nome;
  final String email;
  final String role; // 'adm' ou 'socio'
  final String cargo;

  UsuarioModel({
    required this.uid,
    required this.nome,
    required this.email,
    required this.role,
    required this.cargo,
  });

  // Transforma o JSON do Firebase em um objeto C# / Dart
  factory UsuarioModel.fromMap(Map<String, dynamic> data, String documentId) {
    return UsuarioModel(
      uid: documentId,
      nome: data['nome'] ?? '',
      email: data['email'] ?? '',
      role: data['role'] ?? 'socio',
      cargo: data['cargo'] ?? 'Sócio',
    );
  }

  // Transforma o objeto em JSON para salvar no Firebase
  Map<String, dynamic> toMap() {
    return {
      'nome': nome,
      'email': email,
      'role': role,
      'cargo': cargo,
    };
  }
}